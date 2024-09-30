<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\CourseAbstract;
use Application\abstract\UserAbstract;
use Application\models\Course;
use Application\models\Section;
use Application\models\User;

class SectionControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Section::class;
    protected $TABLE_NAME = "sections";
    protected $TABLE_PRIMARY_ID = "section_id";
    protected $SEARCH_LOOKUP = ["section_name"];

    public function add($data)
    {
        return null;
    }

    public function edit($data)
    {
        global $APPLICATION;

        $mortuary = $data['data'];
        $id = $data['id'];
        $students = $data['students'];
        $control = $APPLICATION->FUNCTIONS->SECTION_STUDENT_CONTROL;

        $edit = $this->editRecord($id, $mortuary);
        if ($edit->code == 200) {
            foreach ($students as $student) {
                $student['section_id'] = $id;

                if ($student['status'] === 'created') {
                    unset($student['status']);

                    $control->addRecord($student);
                } else if ($student['status'] === 'edited') {
                    $id = $student['id'];

                    unset($student['status'], $student['id']);

                    $control->editRecord($id, $student);
                } else if ($student['status'] === 'deleted') {
                    $id = $student['id'];

                    $control->removeRecord($id);
                }
            }
        }

        return $edit;
    }
}