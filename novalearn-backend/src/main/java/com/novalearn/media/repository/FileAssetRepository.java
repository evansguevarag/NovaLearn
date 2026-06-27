package com.novalearn.media.repository;

import com.novalearn.media.entity.FileAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FileAssetRepository
        extends JpaRepository<FileAsset, Long> {

    Optional<FileAsset> findByPublicId(
            String publicId
    );
}