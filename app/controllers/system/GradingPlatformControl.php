<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\models\GradingPlatform;
use Application\controllers\app\Response;


class GradingPlatformControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = GradingPlatform::class;
    protected $TABLE_NAME = "grading_platforms";
    protected $TABLE_PRIMARY_ID = "grading_platform_id";
    protected $SEARCH_LOOKUP = ["name"];

    public function saveGrades($data)
    {
        global $APPLICATION, $CONNECTION;

        try {
            $CONNECTION->NewTransaction();

            $grading_platform_id = $this->GetOrCreateGradingPlatform($data['section_subject_id']);
            
            // Process categories and get updated mappings
            $category_mappings = [];
            
            foreach ($data['categories'] as $category) {
                $category_id = $this->processCategory($grading_platform_id, $category);
                if ($category_id) {
                    $category_mappings[$category['id']] = [
                        'category_id' => $category_id,
                        'columns' => $this->processCategoryColumns($category_id, $category['columns'])
                    ];
                }
            }

            // Process student grades using category mappings
            foreach ($data['student_grades'] as $student_grade) {
                $this->processStudentGrades($student_grade, $category_mappings);
            }

            $CONNECTION->Commit();
            return new Response(200, "Grades saved successfully!");

        } catch (\Throwable $th) {
            $CONNECTION->RollBack();
            throw $th;
        }
    }

    private function GetOrCreateGradingPlatform($section_subject_id) 
    {
        $platform = $this->getBy("section_subject_id", $section_subject_id, false);
        if (!$platform) {
            $platform = $this->addRecord(["section_subject_id" => $section_subject_id]);
            return $platform->body['id'];
        }
        return $platform['grading_platform_id'];
    }

    private function processCategory($grading_platform_id, $category)
    {
        global $APPLICATION;
        $control = $APPLICATION->FUNCTIONS->GRADING_CATEGORY_CONTROL;

        $category_data = [
            "name" => $category['name'],
            "percentage" => $category['percentage'],
            "grading_platform_id" => $grading_platform_id
        ];

        switch ($category['status']) {
            case 'created':
                $result = $control->addRecord($category_data);
                return $result->body['id'];

            case 'edited':
                $control->editRecord($category['id'], $category_data);
                return $category['id'];

            case 'deleted':
                $control->removeRecord($category['id']);
                return null;

            default:
                return $category['id'];
        }
    }

    private function processCategoryColumns($category_id, $columns) 
    {
        global $APPLICATION;
        $column_control = $APPLICATION->FUNCTIONS->GRADING_SCORE_COLUMN_CONTROL;
        $column_mappings = [];

        foreach ($columns as $column) {
            $column_data = [
                "grading_category_id" => $category_id,
                "column_number" => $column['column_number'],
                "passing_score" => $column['passing_score']
            ];

            switch ($column['passing_score_status']) {
                case 'created':
                    $result = $column_control->addRecord($column_data);
                    $column_mappings[$column['id']] = $result->body['id'];
                    break;

                case 'edited':
                    $column_control->editRecord($column['id'], $column_data);
                    $column_mappings[$column['id']] = $column['id'];
                    break;

                case 'deleted':
                    $column_control->removeRecord($column['id']);
                    break;

                default:
                    $column_mappings[$column['id']] = $column['id'];
            }
        }

        return $column_mappings;
    }

    private function processStudentGrades($student_grade, $category_mappings) 
    {
        global $APPLICATION;
        $control = $APPLICATION->FUNCTIONS->GRADING_SCORE_CONTROL;

        foreach ($student_grade['category_scores'] as $category_score) {
            if (!isset($category_mappings[$category_score['category_id']])) {
                continue;
            }

            $category_map = $category_mappings[$category_score['category_id']];

            foreach ($category_score['scores'] as $score) {
                if (!isset($category_map['columns'][$score['column_id']])) {
                    continue;
                }

                $score_data = [
                    "student_id" => $student_grade['student_id'],
                    "score" => $score['score'],
                    "grading_score_column_id" => $category_map['columns'][$score['column_id']]
                ];

                switch ($score['status']) {
                    case 'created':
                        $control->addRecord($score_data);
                        break;

                    case 'edited':
                        $control->editRecord($score['id'], $score_data);
                        break;

                    case 'deleted':
                        $control->removeRecord($score['id']);
                        break;
                }
            }
        }
    }
}