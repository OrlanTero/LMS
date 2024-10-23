<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\abstract\UserAbstract;
use Application\models\Student;
use Application\models\User;

class StudentControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Student::class;
    protected $TABLE_NAME = "users";
    protected $TABLE_PRIMARY_ID = "user_id";
    protected $SEARCH_LOOKUP = ["displayName", "firstname", "lastname", "email", "no"];

    public function add($data)
    {
        $data['password'] = md5($data['password']);

        return $this->addRecord($data);
    }

    public function getAll($asObject = false)
    {
        return $this->filterRecords(['user_type' => 1], $asObject);
    }

    public function importStudents($summary)
    {   
        global $APPLICATION;

        $students = $summary['students'];
        $subjects = $summary['subjects'];
        $section = $summary['section'];

        $section_id = null;
        $subject_ids = [];
        $student_ids = [];

        if (isset($section)) {
            if ($section['flag'] == "created") {
                unset($section['section_id'], $section['flag'], $section['course_name']);

               $insertedSection = $APPLICATION->FUNCTIONS->SECTION_CONTROL->addRecord($section);

               $section_id = $insertedSection->body['id'];
            }  else {
                $section_id = $section['section_id'];
            }
        } 

        if (isset($subjects)) {
            foreach ($subjects as $subject) {
                
                if ($subject['professor']['flag'] == "created") {
                    unset($subject['professor']['flag']);

                    $displayName = $subject['professor']['displayName'];
                    $nameParts = explode(' ', $displayName);
                        
                    $newUser = [
                        "firstname" => $nameParts[0],
                        "lastname" => end($nameParts),
                        "email" => strtolower(str_replace(' ', '', $displayName)) . '@gmail.com',
                        "password" => md5("PROFESSOR"),
                        "user_type" => 2
                    ];

                    $insertedUser = $APPLICATION->FUNCTIONS->USER_CONTROL->addRecord($newUser);

                    $newProfessor = [
                        "user_id" => $insertedUser->body['id'],
                        "main_course_id" => $subject['professor']['main_course_id']
                    ];

                    $insertedProfessor = $APPLICATION->FUNCTIONS->PROFESSOR_CONTROL->addRecord($newProfessor);

                    $professor_id = $insertedProfessor->body['id'];  
                }  else {
                    $professor_id = $subject['professor']['professor_id'];
                }
                
                if ($subject['flag'] == "created") {    
                    unset($subject['flag']);

                    $newSubject = [
                        "subject_name" => $subject['name'],
                        "subject_code" => $subject['code'],
                        "course_id" => $subject['course_id'],
                    ];

                    $insertedSubject = $APPLICATION->FUNCTIONS->SUBJECT_CONTROL->addRecord($newSubject);

                    $subject_ids[] = [
                        "subject_id" => $insertedSubject->body['id'],
                        "professor_id" => $professor_id
                    ];
                } else {
                    $subject_ids[] = [
                        "subject_id" => $subject['subject_id'],
                        "professor_id" => $professor_id
                    ];
                }
            }
        }

        if (isset($students)) {
            foreach ($students as $student) {
                $studentData = [
                    "firstname" => $student['firstName'],
                    "lastname" => $student['lastName'],
                    "middlename" => $student['middleName'],
                    "email" => $student['email'],
                    "password" => md5($student['no']),
                    "no" => $student['no'],
                    "user_type" => 1
                ];

                $insertedStudent = $this->addRecord($studentData);

                $student_ids[] = $insertedStudent->body['id'];
            }
        }

        foreach ($subject_ids as $subject) {
            $data = [
                "subject_id" => $subject['subject_id'],
                "section_id" => $section_id,
                "professor_id" => $subject['professor_id']
            ];

            $APPLICATION->FUNCTIONS->SECTION_SUBJECT_CONTROL->addRecord($data);
        }

        foreach ($student_ids as $student_id) {
            $data = [
                "section_id" => $section_id,
                "student_id" => $student_id
            ];

            $APPLICATION->FUNCTIONS->SECTION_STUDENT_CONTROL->addRecord($data);
        }

        // return $this->addRecord($summary);
    }
}