<?php


namespace Application\models;

use Application\abstract\GradingPlatformAbstract;

class GradingPlatform extends GradingPlatformAbstract
{

    public $categories = [];

    public function __construct($data = [])
    {
        $this->applyData($data, GradingPlatformAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->categories = $APPLICATION->FUNCTIONS->GRADING_CATEGORY_CONTROL->filterRecords([
            "grading_platform_id" => $this->grading_platform_id
        ], true);
    }
}