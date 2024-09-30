<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\CourseAbstract;
use Application\abstract\UserAbstract;
use Application\models\Course;
use Application\models\Section;
use Application\models\SectionStudent;
use Application\models\User;

class SectionStudentControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = SectionStudent::class;
    protected $TABLE_NAME = "section_students";
    protected $TABLE_PRIMARY_ID = "section_student_id";
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