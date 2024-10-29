<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\models\GradingScore;

class GradingScoreControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = GradingScore::class;
    protected $TABLE_NAME = "grading_scores";
    protected $TABLE_PRIMARY_ID = "grading_score_id";
    protected $SEARCH_LOOKUP = ["name"];

    public function edit($data)
    {
    }
}