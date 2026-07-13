package com.novalearn.core.setting.repository;

import com.novalearn.core.setting.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SystemSettingRepository
        extends JpaRepository<SystemSetting, Long> {

    Optional<SystemSetting> findFirstByOrderByIdAsc();
}
