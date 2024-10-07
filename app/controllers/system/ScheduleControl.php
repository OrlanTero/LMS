<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\CourseAbstract;
use Application\abstract\UserAbstract;
use Application\models\Course;
use Application\models\Professor;
use Application\models\Schedule;
use Application\models\Staff;
use Application\models\User;

class ScheduleControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Schedule::class;
    protected $TABLE_NAME = "schedules";
    protected $TABLE_PRIMARY_ID = "schedule_id";
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