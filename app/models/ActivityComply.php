<?php


namespace Application\models;

use Application\abstract\ActivityComplyAbstract;

class ActivityComply extends ActivityComplyAbstract
{

    public function __construct($data = [])
    {
        $this->applyData($data, ActivityComplyAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;
    }
}