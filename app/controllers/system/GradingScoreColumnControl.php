<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\models\GradingScoreColumn;

class GradingScoreColumnControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = GradingScoreColumn::class;
    protected $TABLE_NAME = "grading_score_columns";
    protected $TABLE_PRIMARY_ID = "grading_score_column_id";
    protected $SEARCH_LOOKUP = ["name"];

    public function edit($data)
    {
    }
}