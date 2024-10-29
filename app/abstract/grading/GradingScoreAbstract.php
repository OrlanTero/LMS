<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class GradingScoreAbstract extends ModelDefaultFunctions
{
    public $grading_score_id;

    public $grading_score_column_id;
    
    public $student_id;

    public $score;
    
    public $date_created;

    public $status;
}