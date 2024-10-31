<?php


namespace Application\models;

use Application\abstract\ResourcesGroupAbstract;

class ResourcesGroup extends ResourcesGroupAbstract
{

    public $resources = [];
    public function __construct($data = [])
    {
        $this->applyData($data, ResourcesGroupAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->resources = $APPLICATION->FUNCTIONS->RESOURCES_CONTROL->filterRecords([
            "resources_group_id" => $this->resources_group_id
        ], true);
    }
}