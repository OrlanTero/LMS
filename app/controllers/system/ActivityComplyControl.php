<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\models\ActivityComply;

class ActivityComplyControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = ActivityComply::class;
    protected $TABLE_NAME = "activities_complied";
    protected $TABLE_PRIMARY_ID = "comply_id";
    protected $SEARCH_LOOKUP = ["link", "text"];

    public function add($data)
    {
        global $APPLICATION, $SESSION;

        $data["student_id"] = $SESSION->user_id;

        return $this->addRecord($data);
    }
}