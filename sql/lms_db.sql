-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 01, 2024 at 02:29 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.1.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lms_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `activity_id` int(11) NOT NULL,
  `section_subject_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `due_date` date DEFAULT NULL,
  `file` varchar(255) DEFAULT NULL,
  `passing_type` varchar(255) NOT NULL,
  `activity_status` varchar(255) NOT NULL DEFAULT 'On Going',
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`activity_id`, `section_subject_id`, `title`, `description`, `due_date`, `file`, `passing_type`, `activity_status`, `status`, `date_created`) VALUES
(1, 1, 'Activity 1', 'This is sample activity description', NULL, NULL, 'File', 'On Going', 0, '2024-10-23 01:45:05'),
(2, 1, 'Activity 2', 'Nanaman?', NULL, NULL, 'Link', 'On Going', 0, '2024-10-31 06:46:03'),
(3, 1, 'Activity 3', 'Text lang naman to', '0000-00-00', NULL, 'Text', 'On Going', 0, '2024-10-31 06:49:44'),
(4, 1, 'A', 'aw', NULL, NULL, 'Link', 'On Going', 0, '2024-10-31 06:52:08');

-- --------------------------------------------------------

--
-- Table structure for table `activities_complied`
--

CREATE TABLE `activities_complied` (
  `comply_id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `text` text NOT NULL,
  `link` varchar(255) NOT NULL,
  `file` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activities_complied`
--

INSERT INTO `activities_complied` (`comply_id`, `activity_id`, `student_id`, `text`, `link`, `file`, `status`, `date_created`) VALUES
(2, 2, 5, '', 'https://www.chess.com/home', '', 0, '2024-11-01 13:14:04');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `announcement_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `for_view` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`announcement_id`, `user_id`, `for_view`, `title`, `content`, `status`, `date_created`) VALUES
(1, 3, 0, 'Annoncement Title', '<p>This is the example of a announcement</p>', 0, '2024-10-10 07:06:17');

-- --------------------------------------------------------

--
-- Table structure for table `classrooms`
--

CREATE TABLE `classrooms` (
  `classroom_id` int(11) NOT NULL,
  `classroom_name` varchar(255) NOT NULL,
  `building` varchar(255) NOT NULL,
  `floor` varchar(255) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classrooms`
--

INSERT INTO `classrooms` (`classroom_id`, `classroom_name`, `building`, `floor`, `status`, `date_created`) VALUES
(1, 'Room A', '1', '1', 1, '2024-09-29 21:58:02');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `course_id` int(11) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`course_id`, `course_name`, `description`, `status`, `date_created`) VALUES
(1, 'BSIT', 'descriptio', 1, '2024-09-29 17:09:23');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL,
  `department_name` varchar(255) NOT NULL,
  `head` varchar(255) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `department_name`, `head`, `status`, `date_created`) VALUES
(1, 'IT Department', 'Eman Gumayagay', 1, '2024-10-06 23:23:00');

-- --------------------------------------------------------

--
-- Table structure for table `email_verifications`
--

CREATE TABLE `email_verifications` (
  `verification_id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `verification` varchar(255) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `email_verifications`
--

INSERT INTO `email_verifications` (`verification_id`, `user_id`, `verification`, `date_created`) VALUES
(6, '1', '529649', '2024-09-22 21:34:47'),
(22, '3', '935804', '2024-10-27 13:25:45'),
(26, '5', '479302', '2024-11-01 12:46:35'),
(27, '4', '275240', '2024-11-01 13:25:12');

-- --------------------------------------------------------

--
-- Table structure for table `exams`
--

CREATE TABLE `exams` (
  `exam_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `section_subject_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `count_items` int(11) NOT NULL,
  `duration` varchar(255) NOT NULL,
  `date_start` datetime DEFAULT NULL,
  `due_date` date NOT NULL,
  `file` varchar(255) NOT NULL,
  `exam_status` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exams`
--

INSERT INTO `exams` (`exam_id`, `section_id`, `section_subject_id`, `title`, `description`, `count_items`, `duration`, `date_start`, `due_date`, `file`, `exam_status`, `status`, `date_created`) VALUES
(1, 1, 1, 'Exam 1', '', 100, '30 Minutes', '2024-10-24 11:25:48', '2024-10-25', 'public/assets/media/uploads/exams/cmdc.sql.sql', 0, 0, '2024-10-23 03:21:56');

-- --------------------------------------------------------

--
-- Table structure for table `grading_categories`
--

CREATE TABLE `grading_categories` (
  `grading_category_id` int(11) NOT NULL,
  `grading_platform_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `percentage` float NOT NULL,
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grading_categories`
--

INSERT INTO `grading_categories` (`grading_category_id`, `grading_platform_id`, `name`, `percentage`, `status`, `date_created`) VALUES
(1, 1, 'Written Works', 30, 0, '2024-10-29 01:16:42'),
(2, 1, 'Performance Tasks', 50, 0, '2024-10-29 01:16:42'),
(3, 1, 'Exams', 20, 0, '2024-10-29 01:16:42');

-- --------------------------------------------------------

--
-- Table structure for table `grading_platforms`
--

CREATE TABLE `grading_platforms` (
  `grading_platform_id` int(11) NOT NULL,
  `section_subject_id` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grading_platforms`
--

INSERT INTO `grading_platforms` (`grading_platform_id`, `section_subject_id`, `status`, `date_created`) VALUES
(1, 1, 0, '2024-10-29 01:16:42');

-- --------------------------------------------------------

--
-- Table structure for table `grading_scores`
--

CREATE TABLE `grading_scores` (
  `grading_score_id` int(11) NOT NULL,
  `grading_score_column_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `score` float NOT NULL,
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grading_scores`
--

INSERT INTO `grading_scores` (`grading_score_id`, `grading_score_column_id`, `student_id`, `score`, `status`, `date_created`) VALUES
(3, 2, 5, 100, 0, '2024-10-29 13:10:13'),
(4, 3, 5, 100, 0, '2024-10-31 01:38:27'),
(9, 14, 5, 50, 0, '2024-10-31 02:20:39');

-- --------------------------------------------------------

--
-- Table structure for table `grading_score_columns`
--

CREATE TABLE `grading_score_columns` (
  `grading_score_column_id` int(11) NOT NULL,
  `grading_category_id` int(11) NOT NULL,
  `column_number` varchar(255) NOT NULL,
  `passing_score` float NOT NULL,
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grading_score_columns`
--

INSERT INTO `grading_score_columns` (`grading_score_column_id`, `grading_category_id`, `column_number`, `passing_score`, `status`, `date_created`) VALUES
(1, 1, '1', 100, 0, '2024-10-29 09:49:21'),
(2, 2, '1', 100, 0, '2024-10-29 09:49:21'),
(3, 1, '2', 100, 0, '2024-10-31 01:38:27'),
(14, 1, '3', 100, 0, '2024-10-31 02:20:39');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_type` int(11) NOT NULL,
  `content` text NOT NULL,
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`post_id`, `user_id`, `post_type`, `content`, `status`, `date_created`) VALUES
(2, 3, 2, '<p>This is my Post</p>', 0, '2024-10-10 05:34:18'),
(3, 3, 2, '<p>Hatdogggggggg</p>', 0, '2024-10-10 05:46:11'),
(4, 4, 2, '<p><strong>This is my Post as Faculty</strong></p><p>&nbsp;</p><p>Hello Everyone</p>', 0, '2024-10-23 05:36:41'),
(5, 4, 2, '<h2><strong>This is the title</strong></h2><p>&nbsp;</p><p>This is the content</p>', 0, '2024-10-23 05:37:38');

-- --------------------------------------------------------

--
-- Table structure for table `post_comments`
--

CREATE TABLE `post_comments` (
  `post_comment_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `post_comments`
--

INSERT INTO `post_comments` (`post_comment_id`, `post_id`, `user_id`, `comment`, `status`, `date_created`) VALUES
(2, 2, 4, 'This is my comment', 0, '2024-10-31 17:25:25');

-- --------------------------------------------------------

--
-- Table structure for table `post_likes`
--

CREATE TABLE `post_likes` (
  `post_like_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `post_likes`
--

INSERT INTO `post_likes` (`post_like_id`, `post_id`, `user_id`, `date_created`) VALUES
(14, 4, 4, '2024-10-23 06:03:02'),
(16, 2, 3, '2024-10-23 06:04:26'),
(22, 2, 4, '2024-10-31 09:17:28');

-- --------------------------------------------------------

--
-- Table structure for table `post_medias`
--

CREATE TABLE `post_medias` (
  `post_medias` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `filepath` text NOT NULL,
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `post_medias`
--

INSERT INTO `post_medias` (`post_medias`, `post_id`, `filepath`, `status`, `date_created`) VALUES
(1, 2, 'public/assets/media/uploads/pngtree-rainbow-curves-abstract-colorful-background-image_2164067.jpg', 0, '2024-10-10 05:34:18'),
(2, 3, 'public/assets/media/uploads/g.jpg', 0, '2024-10-10 05:46:11');

-- --------------------------------------------------------

--
-- Table structure for table `professors`
--

CREATE TABLE `professors` (
  `professor_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `main_course_id` int(11) NOT NULL,
  `description` text NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `professors`
--

INSERT INTO `professors` (`professor_id`, `user_id`, `main_course_id`, `description`, `status`, `date_created`) VALUES
(1, 4, 1, 'awdaw', 1, '2024-09-29 18:09:21'),
(2, 6, 1, '', 1, '2024-10-23 09:15:42'),
(3, 8, 1, '', 1, '2024-10-23 09:19:03');

-- --------------------------------------------------------

--
-- Table structure for table `resources`
--

CREATE TABLE `resources` (
  `resources_id` int(11) NOT NULL,
  `ref` varchar(255) NOT NULL,
  `resources_group_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `section_subject_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `file_size` float NOT NULL,
  `file_type` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resources`
--

INSERT INTO `resources` (`resources_id`, `ref`, `resources_group_id`, `section_id`, `section_subject_id`, `title`, `description`, `file_size`, `file_type`, `file_name`, `file_path`, `status`, `date_created`) VALUES
(5, 'GRP-1729645498-7DJESWB4', 9, 1, 1, 'Resources 1', '...', 22479, 'sql', 'cmdc.sql', 'public/assets/media/resources/GRP-1729645498-7DJESWB4/cmdc.sql', 0, '2024-10-23 01:04:58');

-- --------------------------------------------------------

--
-- Table structure for table `resources_groups`
--

CREATE TABLE `resources_groups` (
  `resources_group_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `section_subject_id` int(11) NOT NULL,
  `ref` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `resources_groups`
--

INSERT INTO `resources_groups` (`resources_group_id`, `section_id`, `section_subject_id`, `ref`, `title`, `description`, `status`, `date_created`) VALUES
(9, 1, 1, 'GRP-1729645498-7DJESWB4', 'Resources Group', '...', 0, '2024-10-23 01:04:58');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `schedule_id` int(11) NOT NULL,
  `id` int(11) NOT NULL,
  `description` text NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`schedule_id`, `id`, `description`, `status`, `date_created`) VALUES
(1, 1, 'Subject Web Development Schedule', 1, '2024-10-07 02:19:35');

-- --------------------------------------------------------

--
-- Table structure for table `schedule_items`
--

CREATE TABLE `schedule_items` (
  `schedule_item_id` int(11) NOT NULL,
  `schedule_id` int(11) NOT NULL,
  `day` varchar(255) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedule_items`
--

INSERT INTO `schedule_items` (`schedule_item_id`, `schedule_id`, `day`, `start_time`, `end_time`, `status`, `date_created`) VALUES
(1, 1, 'Monday', '13:02:00', '13:02:00', 1, '2024-10-07 02:19:35');

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `section_id` int(11) NOT NULL,
  `section_name` varchar(255) NOT NULL,
  `adviser_id` int(11) NOT NULL,
  `semester` int(11) NOT NULL,
  `year_level` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`section_id`, `section_name`, `adviser_id`, `semester`, `year_level`, `course_id`, `status`, `date_created`) VALUES
(1, 'BSIT 1 A', 1, 1, 1, 1, 0, '2024-09-29 22:36:29'),
(2, 'A', 1, 2, 1, 1, 0, '2024-10-06 23:05:07'),
(3, 'BSIT 1 A', 1, 1, 1, 1, 0, '2024-10-16 09:54:51');

-- --------------------------------------------------------

--
-- Table structure for table `section_students`
--

CREATE TABLE `section_students` (
  `section_student_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `section_students`
--

INSERT INTO `section_students` (`section_student_id`, `section_id`, `student_id`, `status`, `date_created`) VALUES
(2, 1, 5, 1, '2024-09-30 00:17:18'),
(3, 1, 9, 1, '2024-10-23 09:19:03');

-- --------------------------------------------------------

--
-- Table structure for table `section_subjects`
--

CREATE TABLE `section_subjects` (
  `section_subject_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL,
  `schedule_id` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `section_subjects`
--

INSERT INTO `section_subjects` (`section_subject_id`, `section_id`, `subject_id`, `professor_id`, `schedule_id`, `status`, `date_created`) VALUES
(1, 1, 1, 1, 1, 0, '2024-10-07 00:22:41'),
(2, 1, 2, 2, 0, 0, '2024-10-23 09:15:42'),
(3, 1, 3, 3, 0, 0, '2024-10-23 09:19:03');

-- --------------------------------------------------------

--
-- Table structure for table `staffs`
--

CREATE TABLE `staffs` (
  `staff_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `description` text NOT NULL,
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staffs`
--

INSERT INTO `staffs` (`staff_id`, `user_id`, `department_id`, `description`, `status`, `date_created`) VALUES
(1, 4, 1, 'awdwadaw', 0, '2024-10-07 00:39:03');

-- --------------------------------------------------------

--
-- Table structure for table `sticky_notes`
--

CREATE TABLE `sticky_notes` (
  `sticky_note_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `x` double NOT NULL,
  `y` double NOT NULL,
  `width` double NOT NULL,
  `height` double NOT NULL,
  `rotation` double NOT NULL,
  `content` text NOT NULL,
  `color` varchar(255) NOT NULL,
  `locked` tinyint(1) NOT NULL,
  `status` int(11) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sticky_notes`
--

INSERT INTO `sticky_notes` (`sticky_note_id`, `section_id`, `professor_id`, `user_id`, `x`, `y`, `width`, `height`, `rotation`, `content`, `color`, `locked`, `status`, `date_created`) VALUES
(2, 1, 1, 4, 0.193506, 0.12, 0.267064, 0.284, 0, 'This is first sticky ', 'rgb(255, 229, 180)', 0, 0, '0000-00-00 00:00:00'),
(3, 1, 1, 4, 0.62699256110521, 0.061666666666667, 0.2125398512221, 0.33333333333333, 0, 'Yeeyy', 'rgb(242, 115, 115)', 0, 0, '0000-00-00 00:00:00'),
(4, 1, 1, 4, 0.45377258235919, 0.51166666666667, 0.2125398512221, 0.33333333333333, 0, 'Lastt', 'rgb(174, 198, 207)', 0, 0, '0000-00-00 00:00:00'),
(5, 1, 1, 5, 0.0896624, 0.528, 0.315599, 0.286, 0, 'Hello', 'rgb(230, 230, 250)', 0, 0, '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `subject_id` int(11) NOT NULL,
  `subject_name` varchar(255) NOT NULL,
  `subject_code` varchar(255) NOT NULL,
  `course_id` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`subject_id`, `subject_name`, `subject_code`, `course_id`, `status`, `date_created`) VALUES
(1, 'Web Development', '12334', 1, 1, '2024-09-29 22:48:24'),
(2, 'AB', 'AA', 1, 1, '2024-10-23 09:15:42'),
(3, 'BB', 'AAA1', 1, 1, '2024-10-23 09:19:03');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `no` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `displayName` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `middlename` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `birthdate` date NOT NULL,
  `gender` int(11) NOT NULL,
  `user_type` int(11) NOT NULL DEFAULT 1,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `no`, `email`, `password`, `displayName`, `firstname`, `middlename`, `lastname`, `birthdate`, `gender`, `user_type`, `date_created`, `status`) VALUES
(1, '', 'dreiprojects2@gmail.com', '827ccb0eea8a706c4c34a16891f84e7b', 'Drei Projects', 'Drei', '', 'Projects', '2002-03-21', 1, 4, '2024-09-22 18:45:18', 1),
(3, '', 'jhonorlantero@gmail.com', '827ccb0eea8a706c4c34a16891f84e7b', 'aircon system', 'aircon', '', 'system', '2024-09-17', 0, 4, '2024-09-22 21:59:25', 1),
(4, '', 'playwithorlan@gmail.com', '827ccb0eea8a706c4c34a16891f84e7b', 'Prof Eman', '11', '', '22', '2024-09-25', 0, 2, '2024-09-22 22:05:00', 1),
(5, '123456', 'kimberlytero940@gmail.com', '827ccb0eea8a706c4c34a16891f84e7b', 'Jeen Dee', 'Jeen', '', 'Dee', '2024-09-30', 0, 1, '2024-09-29 23:46:18', 1),
(6, '', 'bb@gmail.com', '172b9057f1e59ddcb93e8522b7968f09', 'BB BB', 'BB', '', 'BB', '0000-00-00', 0, 2, '2024-10-23 09:15:42', 1),
(7, '', 'ar@gmail.com', 'd41d8cd98f00b204e9800998ecf8427e', '', 'Ariana', 'gg', 'aa', '0000-00-00', 0, 1, '2024-10-23 09:15:42', 1),
(8, '', 'pr@gmail.com', '172b9057f1e59ddcb93e8522b7968f09', 'Pr Pr', 'Pr', '', 'Pr', '0000-00-00', 0, 2, '2024-10-23 09:19:03', 1),
(9, '', 'sino@gmail.com', 'd41d8cd98f00b204e9800998ecf8427e', 'Sino Pala', 'Sino', 'Ka', 'Pala', '0000-00-00', 0, 1, '2024-10-23 09:19:03', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`activity_id`);

--
-- Indexes for table `activities_complied`
--
ALTER TABLE `activities_complied`
  ADD PRIMARY KEY (`comply_id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`announcement_id`);

--
-- Indexes for table `classrooms`
--
ALTER TABLE `classrooms`
  ADD PRIMARY KEY (`classroom_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`course_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`);

--
-- Indexes for table `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD PRIMARY KEY (`verification_id`);

--
-- Indexes for table `exams`
--
ALTER TABLE `exams`
  ADD PRIMARY KEY (`exam_id`);

--
-- Indexes for table `grading_categories`
--
ALTER TABLE `grading_categories`
  ADD PRIMARY KEY (`grading_category_id`);

--
-- Indexes for table `grading_platforms`
--
ALTER TABLE `grading_platforms`
  ADD PRIMARY KEY (`grading_platform_id`);

--
-- Indexes for table `grading_scores`
--
ALTER TABLE `grading_scores`
  ADD PRIMARY KEY (`grading_score_id`);

--
-- Indexes for table `grading_score_columns`
--
ALTER TABLE `grading_score_columns`
  ADD PRIMARY KEY (`grading_score_column_id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`post_id`);

--
-- Indexes for table `post_comments`
--
ALTER TABLE `post_comments`
  ADD PRIMARY KEY (`post_comment_id`);

--
-- Indexes for table `post_likes`
--
ALTER TABLE `post_likes`
  ADD PRIMARY KEY (`post_like_id`);

--
-- Indexes for table `post_medias`
--
ALTER TABLE `post_medias`
  ADD PRIMARY KEY (`post_medias`);

--
-- Indexes for table `professors`
--
ALTER TABLE `professors`
  ADD PRIMARY KEY (`professor_id`);

--
-- Indexes for table `resources`
--
ALTER TABLE `resources`
  ADD PRIMARY KEY (`resources_id`);

--
-- Indexes for table `resources_groups`
--
ALTER TABLE `resources_groups`
  ADD PRIMARY KEY (`resources_group_id`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`schedule_id`);

--
-- Indexes for table `schedule_items`
--
ALTER TABLE `schedule_items`
  ADD PRIMARY KEY (`schedule_item_id`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`section_id`);

--
-- Indexes for table `section_students`
--
ALTER TABLE `section_students`
  ADD PRIMARY KEY (`section_student_id`);

--
-- Indexes for table `section_subjects`
--
ALTER TABLE `section_subjects`
  ADD PRIMARY KEY (`section_subject_id`);

--
-- Indexes for table `staffs`
--
ALTER TABLE `staffs`
  ADD PRIMARY KEY (`staff_id`);

--
-- Indexes for table `sticky_notes`
--
ALTER TABLE `sticky_notes`
  ADD PRIMARY KEY (`sticky_note_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`subject_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `activity_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `activities_complied`
--
ALTER TABLE `activities_complied`
  MODIFY `comply_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `announcement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `classrooms`
--
ALTER TABLE `classrooms`
  MODIFY `classroom_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `course_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `email_verifications`
--
ALTER TABLE `email_verifications`
  MODIFY `verification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `exams`
--
ALTER TABLE `exams`
  MODIFY `exam_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `grading_categories`
--
ALTER TABLE `grading_categories`
  MODIFY `grading_category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `grading_platforms`
--
ALTER TABLE `grading_platforms`
  MODIFY `grading_platform_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `grading_scores`
--
ALTER TABLE `grading_scores`
  MODIFY `grading_score_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `grading_score_columns`
--
ALTER TABLE `grading_score_columns`
  MODIFY `grading_score_column_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `post_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `post_comments`
--
ALTER TABLE `post_comments`
  MODIFY `post_comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `post_likes`
--
ALTER TABLE `post_likes`
  MODIFY `post_like_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `post_medias`
--
ALTER TABLE `post_medias`
  MODIFY `post_medias` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `professors`
--
ALTER TABLE `professors`
  MODIFY `professor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `resources`
--
ALTER TABLE `resources`
  MODIFY `resources_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `resources_groups`
--
ALTER TABLE `resources_groups`
  MODIFY `resources_group_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `schedule_items`
--
ALTER TABLE `schedule_items`
  MODIFY `schedule_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `section_students`
--
ALTER TABLE `section_students`
  MODIFY `section_student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `section_subjects`
--
ALTER TABLE `section_subjects`
  MODIFY `section_subject_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `staffs`
--
ALTER TABLE `staffs`
  MODIFY `staff_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sticky_notes`
--
ALTER TABLE `sticky_notes`
  MODIFY `sticky_note_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `subject_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
