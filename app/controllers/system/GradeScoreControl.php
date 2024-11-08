<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\models\GradeScore;

class GradeScoreControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = GradeScore::class;
    protected $TABLE_NAME = "grade_scores";
    protected $TABLE_PRIMARY_ID = "grade_score_id";
    protected $SEARCH_LOOKUP = [];
}