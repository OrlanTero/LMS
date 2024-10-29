<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class GradingScoreColumnAbstract extends ModelDefaultFunctions
{
    public $grading_score_column_id;

    public $grading_category_id;
    
    public $column_number;

    public $passing_score;
    
    public $date_created;

    public $status;
}