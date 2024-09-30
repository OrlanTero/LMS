<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class SubjectAbstract extends ModelDefaultFunctions
{
    public $subject_id;

    public $subject_name;

    public $course_id;
    public $date_created;

    public $status;


}