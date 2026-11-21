package com.example.rapicon.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class FileMailerService {
    private final S3Client s3;
    private final JavaMailSender mailSender;
    private final String from;
    private final String fromName;

    public FileMailerService(S3Client s3,
                             JavaMailSender mailSender,
                             @Value("${app.email.from}") String from,
                             @Value("${app.email.fromName}") String fromName) {
        this.s3 = s3;
        this.mailSender = mailSender;
        this.from = from;
        this.fromName = fromName;
    }

    public void sendFiles(String toEmail, List<String> fileUrls) {

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            helper.setFrom(from, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Your AI architecture plans");
            helper.setText("Thank you for your purchase. Your files are attached.", false);

            Set<String> usedNames = new HashSet<>();

            for (String url : fileUrls) {

                S3Location loc = parse(url);
                String bucket = loc.bucket();
                String key = loc.key();

                ResponseBytes<GetObjectResponse> object =
                        s3.getObjectAsBytes(b -> b.bucket(bucket).key(key));

                String type = object.response().contentType() != null
                        ? object.response().contentType()
                        : "application/octet-stream";

                helper.addAttachment(
                        uniqueName(key.substring(key.lastIndexOf('/') + 1), usedNames),
                        new ByteArrayResource(object.asByteArray()),
                        type);
            }

            mailSender.send(message);

        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new IllegalStateException("Could not build email", e);
        }
    }

    // two files with the same name would overwrite each other in the email
    private String uniqueName(String name, Set<String> used) {
        String candidate = name;
        int n = 2;
        while (!used.add(candidate)) {
            int dot = name.lastIndexOf('.');
            candidate = dot > 0
                    ? name.substring(0, dot) + " (" + n + ")" + name.substring(dot)
                    : name + " (" + n + ")";
            n++;
        }
        return candidate;
    }

    private record S3Location(String bucket, String key) {}

    private static final Pattern VIRTUAL_HOST =
            Pattern.compile("^(.+?)\\.s3[.-].*amazonaws\\.com$");

    // supports https://bucket.s3.region.amazonaws.com/key,
    //          https://s3.region.amazonaws.com/bucket/key and s3://bucket/key
    private S3Location parse(String url) {
        URI uri = URI.create(url);
        String host = uri.getHost();
        String path = uri.getPath().substring(1);          // already URL-decoded, leading "/" removed

        if ("s3".equalsIgnoreCase(uri.getScheme())) {      // s3://bucket/key
            return new S3Location(host, path);
        }

        Matcher m = VIRTUAL_HOST.matcher(host);
        if (m.matches()) {                                  // bucket.s3.region.amazonaws.com/key
            return new S3Location(m.group(1), path);
        }

        int slash = path.indexOf('/');                      // s3.region.amazonaws.com/bucket/key
        return new S3Location(path.substring(0, slash), path.substring(slash + 1));
    }
}
