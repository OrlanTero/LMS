<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\CourseAbstract;
use Application\abstract\SubjectAbstract;
use Application\abstract\UserAbstract;
use Application\models\Course;
use Application\models\Subject;
use Application\models\User;

class SubjectControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Subject::class;
    protected $TABLE_NAME = "subjects";
    protected $TABLE_PRIMARY_ID = "subject_id";
    protected $SEARCH_LOOKUP = ["subject_name"];

    public function add($data)
    {
        return null;
    }

    public function update($id, $data)
    {
        return null;
    }
}