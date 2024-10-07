<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\CourseAbstract;
use Application\abstract\UserAbstract;
use Application\models\Course;
use Application\models\Department;
use Application\models\SectionSubject;
use Application\models\User;

class SectionSubjectControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = SectionSubject::class;
    protected $TABLE_NAME = "section_subjects";
    protected $TABLE_PRIMARY_ID = "section_subject_id";
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