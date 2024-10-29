<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class GradingPlatformAbstract extends ModelDefaultFunctions
{
    public $grading_platform_id;

    public $section_subject_id;

    public $date_created;

    public $status;
}