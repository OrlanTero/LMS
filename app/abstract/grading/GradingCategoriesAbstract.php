<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class GradingCategoriesAbstract extends ModelDefaultFunctions
{
    public $grading_category_id;

    public $grading_platform_id;
    
    public $name;

    public $percentage;

    public $date_created;

    public $status;
}