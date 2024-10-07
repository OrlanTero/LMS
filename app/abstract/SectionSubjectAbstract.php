<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class SectionSubjectAbstract extends ModelDefaultFunctions
{
    public $section_subject_id;

    public $section_id;

    public $subject_id;

    public $professor_id;
    public $schedule_id;

    public $status;

    public $date_created;
}