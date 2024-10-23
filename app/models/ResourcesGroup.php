<?php


namespace Application\models;

use Application\abstract\ResourcesGroupAbstract;

class ResourcesGroup extends ResourcesGroupAbstract
{

    public function __construct($data = [])
    {
        $this->applyData($data, ResourcesGroupAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

    }
}