<?php


namespace Application\models;

use Application\abstract\GradingScoreAbstract;

class GradingScore extends GradingScoreAbstract
{

    public function __construct($data = [])
    {
        $this->applyData($data, GradingScoreAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;
    }
}