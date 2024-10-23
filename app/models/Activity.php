<?php


namespace Application\models;

use Application\abstract\ActivityAbstract;

class Activity extends ActivityAbstract
{

    public function __construct($data = [])
    {
        $this->applyData($data, ActivityAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;
    }
}