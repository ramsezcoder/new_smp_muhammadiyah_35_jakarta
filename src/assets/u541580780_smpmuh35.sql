-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jan 07, 2026 at 04:37 PM
-- Server version: 11.8.3-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u541580780_smpmuh35`
--

-- --------------------------------------------------------

--
-- Table structure for table `articles`
--

CREATE TABLE `articles` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content_html` longtext NOT NULL,
  `excerpt` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `tags_json` text DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `featured_image` varchar(255) DEFAULT NULL,
  `featured_image_alt` varchar(255) DEFAULT NULL,
  `author_id` int(11) NOT NULL,
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `gallery_images`
--

CREATE TABLE `gallery_images` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `filename` varchar(255) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `gallery_images`
--

INSERT INTO `gallery_images` (`id`, `title`, `alt_text`, `filename`, `sort_order`, `is_published`, `created_at`, `updated_at`) VALUES
(1, 'MG_6069', 'MG_6069', 'mg-6069.webp', 1, 1, '2026-01-06 23:34:02', '2026-01-06 23:34:02');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `ip_address` varchar(64) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `session_token`, `user_agent`, `ip_address`, `expires_at`, `created_at`) VALUES
(1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJTdXBlciBBZG1pbmlzdHJhdG9yIiwiZW1haWwiOiJhZG1pbkBzbXBtdWgzNS5zY2guaWQiLCJyb2xlIjoiU3VwZXJhZG1pbiIsImlhdCI6MTc2Nzc0MjEzMCwiZXhwIjoxNzY3NzYzNzMwfQ.vOMT4vQYA9XVi4AYbi2eYUNOOCHGhCi0V7RoGKd90AU', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '203.83.40.3', '2026-01-07 05:28:50', '2026-01-06 23:28:50'),
(2, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJTdXBlciBBZG1pbmlzdHJhdG9yIiwiZW1haWwiOiJhZG1pbkBzbXBtdWgzNS5zY2guaWQiLCJyb2xlIjoiU3VwZXJhZG1pbiIsImlhdCI6MTc2Nzc0MjE3MSwiZXhwIjoxNzY3NzYzNzcxfQ.JCj0JPiX5CDQf4q65bUbEiBK5_VuNKCsWBnTZctmqUM', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '203.83.40.3', '2026-01-07 05:29:31', '2026-01-06 23:29:31'),
(3, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJTdXBlciBBZG1pbmlzdHJhdG9yIiwiZW1haWwiOiJhZG1pbkBzbXBtdWgzNS5zY2guaWQiLCJyb2xlIjoiU3VwZXJhZG1pbiIsImlhdCI6MTc2Nzc0NDQyMCwiZXhwIjoxNzY3NzY2MDIwfQ._UxP91awtkqGz7RfUs87gOCv5dz4g5rz0J2WTnfg2HE', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2404:c0:5c20::25ae:7d5d', '2026-01-07 06:07:00', '2026-01-07 00:07:00'),
(4, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJTdXBlciBBZG1pbmlzdHJhdG9yIiwiZW1haWwiOiJhZG1pbkBzbXBtdWgzNS5zY2guaWQiLCJyb2xlIjoiU3VwZXJhZG1pbiIsImlhdCI6MTc2Nzc4NjE5MSwiZXhwIjoxNzY3ODA3NzkxfQ.SdDAxRZk0SbrDzXxoLytAnAu-QBn0LcZTDGRJ3oO1X0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '203.83.40.3', '2026-01-07 17:43:11', '2026-01-07 11:43:11'),
(5, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJTdXBlciBBZG1pbmlzdHJhdG9yIiwiZW1haWwiOiJhZG1pbkBzbXBtdWgzNS5zY2guaWQiLCJyb2xlIjoiU3VwZXJhZG1pbiIsImlhdCI6MTc2Nzc5MDUxMywiZXhwIjoxNzY3ODEyMTEzfQ.Co4RiDQygHWNQuh1d-B3TQ_D85hTAecb1vxBCiet2y0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '203.83.40.3', '2026-01-07 18:55:13', '2026-01-07 12:55:13'),
(6, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJTdXBlciBBZG1pbmlzdHJhdG9yIiwiZW1haWwiOiJhZG1pbkBzbXBtdWgzNS5zY2guaWQiLCJyb2xlIjoiU3VwZXJhZG1pbiIsImlhdCI6MTc2Nzc5MDUzNCwiZXhwIjoxNzY3ODEyMTM0fQ.TtoaGA8-P_6x8w29sgtVnTfyiHbUbl1DVbdgqqI3Uhc', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '203.83.40.3', '2026-01-07 18:55:34', '2026-01-07 12:55:34');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `key` varchar(100) NOT NULL,
  `value` text NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `photo_filename` varchar(255) NOT NULL,
  `bio` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`id`, `name`, `role`, `photo_filename`, `bio`, `sort_order`, `is_published`, `created_at`, `updated_at`) VALUES
(2, 'M. Mabrur Riyamasey Mas\'ud, S.Kom., S.H.', 'Staff Tata Usaha', 'm-mabrur-riyamasey-mas-ud-s-kom-s-h.jpg', '', 1, 1, '2026-01-07 01:40:22', '2026-01-07 01:40:22'),
(3, 'aSD', 'ASD', 'asd.jpg', '', 2, 1, '2026-01-07 02:20:45', '2026-01-07 02:20:45'),
(4, 'ass', 'sss', 'ass.webp', '', 3, 1, '2026-01-07 02:25:20', '2026-01-07 02:25:20'),
(5, 'asdad', 'asdd', 'asdad.webp', '', 4, 1, '2026-01-07 02:31:26', '2026-01-07 02:31:26'),
(6, 'asd23', 'asd213', 'asd23.webp', '', 5, 1, '2026-01-07 02:42:26', '2026-01-07 02:42:26');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(160) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Superadmin','Admin','Author') NOT NULL DEFAULT 'Author',
  `status` enum('active','disabled') NOT NULL DEFAULT 'active',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'Super Administrator', 'admin@smpmuh35.sch.id', '$2y$10$ckz00/FoHj/8qp9zJg2fTuT/39F74k.2WphFx.N6o8OKIKt2G35Da', 'Superadmin', 'active', '2026-01-07 12:55:34', '2026-01-06 22:59:42', '2026-01-07 12:55:34'),
(2, 'Admin Staff', 'adminstaff@smpmuh35.sch.id', '*DD12E0FC3173C8EB045E5E417AA9D37A68E7D367', 'Admin', 'active', NULL, '2026-01-06 22:59:42', '2026-01-06 22:59:42'),
(3, 'Content Author', 'postmaker@smpmuh35.sch.id', '*CA946C1F517CDE60E9721230350CCDAC9B5100D1', 'Author', 'active', NULL, '2026-01-06 22:59:42', '2026-01-06 22:59:42');

-- --------------------------------------------------------

--
-- Table structure for table `videos`
--

CREATE TABLE `videos` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `youtube_id` varchar(40) NOT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `fk_articles_user` (`author_id`);

--
-- Indexes for table `gallery_images`
--
ALTER TABLE `gallery_images`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `fk_sessions_user` (`user_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `videos`
--
ALTER TABLE `videos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `youtube_id` (`youtube_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gallery_images`
--
ALTER TABLE `gallery_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `videos`
--
ALTER TABLE `videos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `articles`
--
ALTER TABLE `articles`
  ADD CONSTRAINT `fk_articles_user` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
