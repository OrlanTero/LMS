<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\CourseAbstract;
use Application\abstract\UserAbstract;
use Application\models\Course;
use Application\models\Professor;
use Application\models\Schedule;
use Application\models\ScheduleItem;
use Application\models\Staff;
use Application\models\User;

class ScheduleItemControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = ScheduleItem::class;
    protected $TABLE_NAME = "schedule_items";
    protected $TABLE_PRIMARY_ID = "schedule_item_id";
    protected $SEARCH_LOOKUP = [];

    public function add($data)
    {
        return null;
    }

    public function update($id, $data)
    {
        return null;
    }
}