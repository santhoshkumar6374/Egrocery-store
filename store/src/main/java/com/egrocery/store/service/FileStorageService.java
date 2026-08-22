package com.egrocery.store.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    /**
     * Saves the file to disk and returns the URL it will be served from.
     */
    String store(MultipartFile file);

    void delete(String fileUrl);
}