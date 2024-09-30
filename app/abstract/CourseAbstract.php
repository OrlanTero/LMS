<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class CourseAbstract extends ModelDefaultFunctions
{
    public $course_id;

    public $course_name;

    public $description;
    public $date_created;

    public $status;


}