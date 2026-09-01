package com.egrocery.store.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.egrocery.store.config.FileStorageProperties;
import com.egrocery.store.exception.BadRequestException;
import com.egrocery.store.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    private final FileStorageProperties properties;
    @Nullable
    private final Cloudinary cloudinary;

    @Override
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file was provided");
        }
        if (file.getSize() > properties.getMaxSizeBytes()) {
            throw new BadRequestException("File exceeds the maximum allowed size of 5MB");
        }

        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String extension = getExtension(original);

        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BadRequestException("Only JPG, JPEG, PNG and WEBP images are allowed");
        }

        if (cloudinary != null) {
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "folder", "egrocery/products",
                                "resource_type", "auto"
                        )
                );
                String secureUrl = (String) uploadResult.get("secure_url");
                log.info("Successfully uploaded image to Cloudinary: {}", secureUrl);
                return secureUrl;
            } catch (IOException e) {
                log.error("Failed to upload image to Cloudinary: {}", e.getMessage(), e);
                throw new BadRequestException("Failed to upload image to Cloudinary: " + e.getMessage());
            }
        }

        // Fallback for local development when Cloudinary credentials are not set
        try {
            Path uploadDir = Paths.get(properties.getDir());
            Files.createDirectories(uploadDir);

            String filename = UUID.randomUUID() + "." + extension;
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target);

            return properties.getUrlPrefix() + "/" + filename;
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file locally: " + e.getMessage());
        }
    }

    @Override
    public void delete(String fileUrl) {
        if (!StringUtils.hasText(fileUrl)) {
            return;
        }

        if (cloudinary != null && fileUrl.contains("cloudinary.com")) {
            try {
                String publicId = extractCloudinaryPublicId(fileUrl);
                if (StringUtils.hasText(publicId)) {
                    cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                    log.info("Successfully destroyed Cloudinary image asset: {}", publicId);
                }
            } catch (Exception e) {
                log.warn("Could not delete image from Cloudinary (url: {}): {}", fileUrl, e.getMessage());
            }
            return;
        }

        // Local storage deletion fallback
        if (fileUrl.startsWith(properties.getUrlPrefix())) {
            String filename = fileUrl.substring(properties.getUrlPrefix().length() + 1);
            try {
                Files.deleteIfExists(Paths.get(properties.getDir()).resolve(filename));
            } catch (IOException ignored) {
                // Best-effort cleanup
            }
        }
    }

    private String extractCloudinaryPublicId(String url) {
        int uploadIndex = url.indexOf("/upload/");
        if (uploadIndex == -1) return null;

        String pathAfterUpload = url.substring(uploadIndex + "/upload/".length());
        pathAfterUpload = pathAfterUpload.replaceFirst("^v\\d+/", "");

        int lastDotIndex = pathAfterUpload.lastIndexOf('.');
        if (lastDotIndex != -1) {
            return pathAfterUpload.substring(0, lastDotIndex);
        }
        return pathAfterUpload;
    }

    private String getExtension(String filename) {
        List<String> parts = List.of(filename.split("\\."));
        if (parts.size() < 2) {
            throw new BadRequestException("File must have an extension");
        }
        return parts.get(parts.size() - 1);
    }
}