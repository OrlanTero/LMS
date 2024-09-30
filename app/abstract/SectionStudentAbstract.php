<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class SectionStudentAbstract extends ModelDefaultFunctions
{
    public $section_student_id;

    public $section_id;

    public $student_id;

    public $date_created;

    public $status;
}