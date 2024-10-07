<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\CourseAbstract;
use Application\abstract\UserAbstract;
use Application\models\Course;
use Application\models\Department;
use Application\models\User;

class DepartmentControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Department::class;
    protected $TABLE_NAME = "departments";
    protected $TABLE_PRIMARY_ID = "department_id";
    protected $SEARCH_LOOKUP = ["department_name"];

    public function add($data)
    {
        return null;
    }

    public function update($id, $data)
    {
        return null;
    }
}