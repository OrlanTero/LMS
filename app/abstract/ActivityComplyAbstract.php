<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class ActivityComplyAbstract extends ModelDefaultFunctions
{
    public $comply_id;

    public $activity_id;

    public $student_id;

    public $link;

    public $text;

    public $file;

    public $date_created;

    public $status;
}