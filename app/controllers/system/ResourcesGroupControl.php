<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\models\ResourcesGroup;


class ResourcesGroupControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = ResourcesGroup::class;
    protected $TABLE_NAME = "resources_groups";
    protected $TABLE_PRIMARY_ID = "resources_group_id";
    protected $SEARCH_LOOKUP = ["title"];

    public function add($data)
    {
        return null;
    }

    public function edit($data)
    {
    }
}