<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\CourseAbstract;
use Application\abstract\UserAbstract;
use Application\models\Course;
use Application\models\Professor;
use Application\models\User;

class ProfessorControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Professor::class;
    protected $TABLE_NAME = "professors";
    protected $TABLE_PRIMARY_ID = "professor_id";
    protected $SEARCH_LOOKUP = ["description"];

    public function add($data)
    {
        return null;
    }

    public function update($id, $data)
    {
        return null;
    }
}