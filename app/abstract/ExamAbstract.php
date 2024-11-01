<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class ExamAbstract extends ModelDefaultFunctions
{
    public $exam_id;

    public $section_subject_id;
    public $section_id;

    public $title;

    public $description;

    public $count_items;

    public $duration;

    public $date_start;

    public $due_date;

    public $file;

    public $exam_status;

    public $date_created;

    public $status;
}