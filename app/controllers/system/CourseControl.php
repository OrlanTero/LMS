<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\CourseAbstract;
use Application\abstract\UserAbstract;
use Application\models\Course;
use Application\models\User;

class CourseControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Course::class;
    protected $TABLE_NAME = "courses";
    protected $TABLE_PRIMARY_ID = "course_id";
    protected $SEARCH_LOOKUP = ["course_name", "description", "lastname", "email"];

    public function add($data)
    {
        return null;
    }

    public function update($id, $data)
    {
        return null;
    }
}