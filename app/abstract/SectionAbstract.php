<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class SectionAbstract extends ModelDefaultFunctions
{
    public $section_id;

    public $section_name;

    public $adviser_id;
    public $course_id;
    public $semester;
    public $year_level;

    public $date_created;

    public $status;
}