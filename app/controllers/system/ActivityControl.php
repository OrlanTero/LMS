<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\models\Activity;

class ActivityControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Activity::class;
    protected $TABLE_NAME = "activities";
    protected $TABLE_PRIMARY_ID = "activity_id";
    protected $SEARCH_LOOKUP = ["title", "description"];

    public function edit($data)
    {
    }
}