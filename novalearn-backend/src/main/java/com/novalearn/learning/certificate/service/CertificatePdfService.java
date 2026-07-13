package com.novalearn.learning.certificate.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfWriter;
import com.novalearn.core.user.entity.User;
import com.novalearn.learning.certificate.entity.Certificate;
import com.novalearn.learning.certificate.entity.CourseCertificateTemplate;
import com.novalearn.learning.certificate.repository.CourseCertificateTemplateRepository;
import com.novalearn.learning.course.entity.Course;
import com.novalearn.learning.enrollment.entity.Enrollment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class CertificatePdfService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final String verificationBaseUrl;
    private final CourseCertificateTemplateRepository templateRepository;

    public CertificatePdfService(
            @Value("${app.certificates.verification-base-url:http://localhost:8080/api/v1/certificates/code}")
            String verificationBaseUrl,
            CourseCertificateTemplateRepository templateRepository
    ) {
        this.verificationBaseUrl = stripTrailingSlash(verificationBaseUrl);
        this.templateRepository = templateRepository;
    }

    public byte[] generate(Certificate certificate) {
        Course course = certificate.getEnrollment().getCourse();

        return templateRepository
                .findByCourseIdAndActiveTrue(course.getId())
                .map(template -> generateWithTemplate(certificate, template))
                .orElseGet(() -> generateDefault(certificate));
    }

    private byte[] generateDefault(Certificate certificate) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4.rotate(), 56, 56, 56, 48);
            PdfWriter writer = PdfWriter.getInstance(document, outputStream);
            document.open();

            Enrollment enrollment = certificate.getEnrollment();
            User student = enrollment.getStudent();
            Course course = enrollment.getCourse();

            Font titleFont = new Font(Font.HELVETICA, 34, Font.BOLD);
            Font subtitleFont = new Font(Font.HELVETICA, 16, Font.NORMAL);
            Font labelFont = new Font(Font.HELVETICA, 12, Font.BOLD);
            Font bodyFont = new Font(Font.HELVETICA, 18, Font.NORMAL);
            Font codeFont = new Font(Font.COURIER, 12, Font.NORMAL);

            Paragraph brand = new Paragraph("NovaLearn", labelFont);
            brand.setAlignment(Element.ALIGN_CENTER);
            document.add(brand);

            Paragraph title = new Paragraph("Certificado de finalizacion", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingBefore(32);
            document.add(title);

            Paragraph subtitle = new Paragraph("Se certifica que", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingBefore(22);
            document.add(subtitle);

            Paragraph studentName = new Paragraph(fullName(student), titleFont);
            studentName.setAlignment(Element.ALIGN_CENTER);
            studentName.setSpacingBefore(10);
            document.add(studentName);

            Paragraph courseIntro = new Paragraph("ha completado satisfactoriamente el curso", subtitleFont);
            courseIntro.setAlignment(Element.ALIGN_CENTER);
            courseIntro.setSpacingBefore(24);
            document.add(courseIntro);

            Paragraph courseTitle = new Paragraph(course.getTitle(), bodyFont);
            courseTitle.setAlignment(Element.ALIGN_CENTER);
            courseTitle.setSpacingBefore(10);
            document.add(courseTitle);

            Paragraph issuedAt = new Paragraph(
                    "Emitido el " + certificate.getIssuedAt().format(DATE_FORMAT),
                    subtitleFont
            );
            issuedAt.setAlignment(Element.ALIGN_CENTER);
            issuedAt.setSpacingBefore(28);
            document.add(issuedAt);

            Image qr = Image.getInstance(qrPng(verificationUrl(certificate)));
            qr.scaleAbsolute(92, 92);
            qr.setAlignment(Element.ALIGN_CENTER);
            qr.setSpacingBefore(26);
            document.add(qr);

            Paragraph code = new Paragraph(
                    "Codigo de verificacion: " + certificate.getCertificateCode(),
                    codeFont
            );
            code.setAlignment(Element.ALIGN_CENTER);
            code.setSpacingBefore(10);
            document.add(code);

            writer.getDirectContent().rectangle(
                    28,
                    28,
                    document.getPageSize().getWidth() - 56,
                    document.getPageSize().getHeight() - 56
            );
            writer.getDirectContent().stroke();

            document.close();
            return outputStream.toByteArray();
        } catch (Exception exception) {
            throw new IllegalStateException("No se pudo generar el PDF del certificado", exception);
        }
    }

    private byte[] generateWithTemplate(
            Certificate certificate,
            CourseCertificateTemplate template
    ) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4.rotate(), 0, 0, 0, 0);
            PdfWriter writer = PdfWriter.getInstance(document, outputStream);
            document.open();

            float pageWidth = document.getPageSize().getWidth();
            float pageHeight = document.getPageSize().getHeight();
            PdfContentByte canvas = writer.getDirectContent();

            Image background = Image.getInstance(template.getTemplateUrl());
            background.scaleAbsolute(pageWidth, pageHeight);
            background.setAbsolutePosition(0, 0);
            canvas.addImage(background);

            Enrollment enrollment = certificate.getEnrollment();
            User student = enrollment.getStudent();
            Course course = enrollment.getCourse();
            Color textColor = parseColor(template.getPrimaryTextColor());

            drawCenteredText(
                    canvas,
                    fullName(student),
                    30,
                    Font.BOLD,
                    textColor,
                    x(pageWidth, template.getStudentNameX()),
                    y(pageHeight, template.getStudentNameY())
            );
            drawCenteredText(
                    canvas,
                    course.getTitle(),
                    16,
                    Font.NORMAL,
                    textColor,
                    x(pageWidth, template.getCourseTitleX()),
                    y(pageHeight, template.getCourseTitleY())
            );
            drawCenteredText(
                    canvas,
                    "Emitido el " + certificate.getIssuedAt().format(DATE_FORMAT),
                    12,
                    Font.NORMAL,
                    textColor,
                    x(pageWidth, template.getIssuedAtX()),
                    y(pageHeight, template.getIssuedAtY())
            );
            drawCenteredText(
                    canvas,
                    "Codigo: " + certificate.getCertificateCode(),
                    10,
                    Font.NORMAL,
                    textColor,
                    x(pageWidth, template.getCertificateCodeX()),
                    y(pageHeight, template.getCertificateCodeY())
            );

            Image qr = Image.getInstance(qrPng(verificationUrl(certificate)));
            qr.scaleAbsolute(82, 82);
            qr.setAbsolutePosition(
                    x(pageWidth, template.getQrX()) - 41,
                    y(pageHeight, template.getQrY()) - 41
            );
            canvas.addImage(qr);

            document.close();
            return outputStream.toByteArray();
        } catch (Exception exception) {
            throw new IllegalStateException("No se pudo generar el PDF del certificado", exception);
        }
    }

    private byte[] qrPng(String value) throws Exception {
        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(value, BarcodeFormat.QR_CODE, 220, 220);
        BufferedImage image = MatrixToImageWriter.toBufferedImage(matrix);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(image, "png", outputStream);
        return outputStream.toByteArray();
    }

    private String verificationUrl(Certificate certificate) {
        return verificationBaseUrl + "/" + certificate.getCertificateCode();
    }

    private String fullName(User user) {
        String firstName = value(user.getFirstName());
        String paternalLastName = value(user.getPaternalLastName());
        String maternalLastName = value(user.getMaternalLastName());
        String lastName = value(user.getLastName());
        String composed = (firstName + " " + paternalLastName + " " + maternalLastName).trim();

        if (!composed.isBlank()) {
            return composed;
        }

        String legacyName = (firstName + " " + lastName).trim();

        if (!legacyName.isBlank()) {
            return legacyName;
        }

        return user.getEmail();
    }

    private String value(String text) {
        return text == null ? "" : text.trim();
    }

    private String stripTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:8080/api/v1/certificates/code";
        }

        return value.endsWith("/")
                ? value.substring(0, value.length() - 1)
                : value;
    }

    private void drawCenteredText(
            PdfContentByte canvas,
            String text,
            float size,
            int style,
            Color color,
            float x,
            float y
    ) {
        Font font = new Font(Font.HELVETICA, size, style, color);
        Phrase phrase = new Phrase(new Chunk(text, font));

        ColumnText.showTextAligned(
                canvas,
                Element.ALIGN_CENTER,
                phrase,
                x,
                y,
                0
        );
    }

    private float x(float pageWidth, BigDecimal percent) {
        return pageWidth * percent.floatValue() / 100;
    }

    private float y(float pageHeight, BigDecimal percent) {
        return pageHeight * percent.floatValue() / 100;
    }

    private Color parseColor(String value) {
        if (value == null || !value.matches("^#[0-9A-Fa-f]{6}$")) {
            return Color.BLACK;
        }

        return Color.decode(value);
    }
}
