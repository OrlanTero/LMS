<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class ActivityAbstract extends ModelDefaultFunctions
{
    public $activity_id;

    public $section_subject_id;

    public $title;

    public $description;

    public $due_date;

    public $file;

    public $activity_status;

    public $date_created;

    public $status;
}