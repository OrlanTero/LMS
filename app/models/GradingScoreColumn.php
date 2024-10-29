<?php


namespace Application\models;

use Application\abstract\GradingScoreColumnAbstract;

class GradingScoreColumn extends GradingScoreColumnAbstract
{

    public $scores = [];
    public function __construct($data = [])
    {
        $this->applyData($data, GradingScoreColumnAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->scores = $APPLICATION->FUNCTIONS->GRADING_SCORE_CONTROL->filterRecords([
            "grading_score_column_id" => $this->grading_score_column_id
        ], true);
    }
}