<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\CourseAbstract;
use Application\abstract\UserAbstract;
use Application\models\Course;
use Application\models\Professor;
use Application\models\Staff;
use Application\models\User;

class StaffControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Staff::class;
    protected $TABLE_NAME = "staffs";
    protected $TABLE_PRIMARY_ID = "staff_id";
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