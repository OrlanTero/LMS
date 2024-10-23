<?php


namespace Application\models;

use Application\abstract\ResourcesAbstract;

class Resources extends ResourcesAbstract
{

    public function __construct($data = [])
    {
        $this->applyData($data, ResourcesAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

    }
}