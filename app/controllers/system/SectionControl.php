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
        $subjects = $data['subjects'];
        $control = $APPLICATION->FUNCTIONS->SECTION_STUDENT_CONTROL;
        $subjectControl = $APPLICATION->FUNCTIONS->SECTION_SUBJECT_CONTROL;

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

            foreach ($subjects as $subject) {
                $subject['section_id'] = $id;

                $schedules = $subject['schedules'];

                unset($subject['schedules']);

                $_ID = null;

                if ($subject['status'] === 'created') {
                    unset($subject['status']);

                    $add = $subjectControl->addRecord($subject);

                    $_ID = $add->body['id'];
                } else if ($subject['status'] === 'edited') {
                    $id = $subject['id'];

                    unset($subject['status'], $subject['id']);

                    $subjectControl->editRecord($id, $subject);

                    $_ID = $id;
                } else if ($subject['status'] === 'deleted') {
                    $id = $subject['id'];

                    $subjectControl->removeRecord($id);
                }

                if (isset($schedules) && !empty($schedules)) {
                    $subject = $subjectControl->get($_ID, true);

                    $schedule = $APPLICATION->FUNCTIONS->SCHEDULE_CONTROL->addRecord([
                        "id" => $_ID,
                        "description" => "Subject " . $subject->subject->subject_name . ' Schedule'
                    ]);

                    if ($schedule->code == 200) {
                        foreach ($schedules as $sched) {
                            $sched['schedule_id'] = $schedule->body['id'];

                            $APPLICATION->FUNCTIONS->SCHEDULE_ITEM_CONTROL->addRecord($sched);
                        }

                        $subjectControl->editRecord($_ID, ['schedule_id' => $schedule->body['id']]);

                    }
                }
            }
        }

        return $edit;
    }
}