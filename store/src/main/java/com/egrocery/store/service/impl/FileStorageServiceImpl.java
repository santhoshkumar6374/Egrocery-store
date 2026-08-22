package com.egrocery.store.service.impl;

import com.egrocery.store.config.FileStorageProperties;
import com.egrocery.store.exception.BadRequestException;
import com.egrocery.store.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    private final FileStorageProperties properties;

    @Override
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file was provided");
        }
        if (file.getSize() > properties.getMaxSizeBytes()) {
            throw new BadRequestException("File exceeds the maximum allowed size");
        }

        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String extension = getExtension(original);

        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BadRequestException("Only JPG, PNG and WEBP images are allowed");
        }

        try {
            Path uploadDir = Paths.get(properties.getDir());
            Files.createDirectories(uploadDir);

            String filename = UUID.randomUUID() + "." + extension;
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target);

            return properties.getUrlPrefix() + "/" + filename;
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file: " + e.getMessage());
        }
    }

    @Override
    public void delete(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith(properties.getUrlPrefix())) {
            return;
        }
        String filename = fileUrl.substring(properties.getUrlPrefix().length() + 1);
        try {
            Files.deleteIfExists(Paths.get(properties.getDir()).resolve(filename));
        } catch (IOException ignored) {
            // Best-effort cleanup; a missing file on disk shouldn't block the API call.
        }
    }

    private String getExtension(String filename) {
        List<String> parts = List.of(filename.split("\\."));
        if (parts.size() < 2) {
            throw new BadRequestException("File must have an extension");
        }
        return parts.get(parts.size() - 1);
    }
}