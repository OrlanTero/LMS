<?php


namespace Application\models;

use Application\abstract\GradingCategoriesAbstract;

class GradingCategory extends GradingCategoriesAbstract
{

    public $columns = [];

    public function __construct($data = [])
    {
        $this->applyData($data, GradingCategoriesAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->columns = $APPLICATION->FUNCTIONS->GRADING_SCORE_COLUMN_CONTROL->filterRecords([
            "grading_category_id" => $this->grading_category_id
        ], true);
    }
}