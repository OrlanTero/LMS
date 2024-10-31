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
            $created_objects = [
                'columns' => [],
                'categories' => [], 
                'scores' => []
            ];
            
            $CONNECTION->NewTransaction();

            $grading_platform_id = $this->GetOrCreateGradingPlatform($data['section_subject_id']);
            
            // Handle removed categories first
            if (!empty($data['removed_categories'])) {
                foreach ($data['removed_categories'] as $category_id) {
                    $this->removeCategory($category_id);
                }
            }

            // Process categories and get updated mappings
            $category_mappings = [];
            
            foreach ($data['categories'] as $category) {
                $category_id = $this->processCategory($grading_platform_id, $category, $created_objects);
                if ($category_id) {
                    $category_mappings[$category['id']] = [
                        'category_id' => $category_id,
                        'columns' => $this->processCategoryColumns($category_id, $category['columns'], $category['removed_columns'], $created_objects)
                    ];
                }
            }

            // Process student grades using category mappings
            foreach ($data['student_grades'] as $student_grade) {
                $this->processStudentGrades($student_grade, $category_mappings, $created_objects);
            }

            $CONNECTION->Commit();
            
            return new Response(200, "Grades saved successfully!", ['created_objects' => $created_objects]);

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

    private function removeCategory($category_id) {
        global $APPLICATION;
        $category_control = $APPLICATION->FUNCTIONS->GRADING_CATEGORY_CONTROL;
        $column_control = $APPLICATION->FUNCTIONS->GRADING_SCORE_COLUMN_CONTROL;
        $score_control = $APPLICATION->FUNCTIONS->GRADING_SCORE_CONTROL;

        // Get all columns for this category
        $columns = $column_control->filterRecords(["grading_category_id" => $category_id], false);

        if ($columns) {
            foreach ($columns as $column) {
                // Get and remove all scores for each column
                $scores = $score_control->filterRecords(["grading_score_column_id" => $column['grading_score_column_id']], false);
                if ($scores) {
                    foreach ($scores as $score) {
                        $score_control->removeRecord($score['grading_score_id']);
                    }
                }
                // Remove the column
                $column_control->removeRecord($column['grading_score_column_id']);
            }
        }

        // Finally remove the category
        $category_control->removeRecord($category_id);
    }

    private function processCategory($grading_platform_id, $category, &$created_objects)
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
                $created_objects['categories'][] = [
                    'previous_id' => $category['id'],
                    'latest_id' => $result->body['id'],
                    'object' => $control->get($result->body['id'], false)
                ];
                return $result->body['id'];

            case 'edited':
                $control->editRecord($category['id'], $category_data);
                return $category['id'];

            case 'deleted':
                $this->removeCategory($category['id']);
                return null;

            default:
                return $category['id'];
        }
    }

    private function processCategoryColumns($category_id, $columns, $removed_columns = [], &$created_objects) 
    {
        global $APPLICATION;
        $column_control = $APPLICATION->FUNCTIONS->GRADING_SCORE_COLUMN_CONTROL;
        $score_control = $APPLICATION->FUNCTIONS->GRADING_SCORE_CONTROL;
        $column_mappings = [];

        // First handle removed columns
        if (!empty($removed_columns)) {
            foreach ($removed_columns as $column_id) {
                // Get all scores for this column
                $scores = $score_control->filterRecords(["grading_score_column_id" => $column_id], false);
                
                if ($scores) {
                    foreach ($scores as $score) {
                        $score_control->removeRecord($score['grading_score_id']);
                    }
                }   
                
                // Then remove the column
                $column_control->removeRecord($column_id);
            }
        }

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
                    $created_objects['columns'][] = [
                        'previous_id' => $column['id'],
                        'latest_id' => $result->body['id'],
                        'object' => $column_control->get($result->body['id'], false)
                    ];
                    break;

                case 'edited':
                    $column_control->editRecord($column['id'], $column_data);
                    $column_mappings[$column['id']] = $column['id'];
                    break;

                case 'deleted':
                    // Get all scores for this column
                    $scores = $score_control->getBy("grading_score_column_id", $column['id'], true);
                    
                    // Remove all scores first
                    foreach ($scores as $score) {
                        $score_control->removeRecord($score['grading_score_id']);
                    }
                    
                    // Then remove the column
                    $column_control->removeRecord($column['id']);
                    break;

                default:
                    $column_mappings[$column['id']] = $column['id'];
            }
        }

        return $column_mappings;
    }

    private function processStudentGrades($student_grade, $category_mappings, &$created_objects) 
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

                $mainScore = $control->get($score['id'], false);

                switch ($score['status']) {
                    case 'created':
                        $result = $control->addRecord($score_data);
                        $created_objects['scores'][] = [
                            'previous_id' => $score['id'],
                            'latest_id' => $result->body['id'],
                            'object' => $control->get($result->body['id'], false)
                        ];
                        break;

                    case 'edited':
                        if ($mainScore) {
                            $control->editRecord($score['id'], $score_data);
                        } else {
                            $result = $control->addRecord($score_data);
                            $created_objects['scores'][] = [
                                'previous_id' => $score['id'],
                                'latest_id' => $result->body['id'],
                                'object' => $control->get($result->body['id'], false)
                            ];
                        }
                        break;

                    case 'deleted':
                        if ($mainScore) {
                            $control->removeRecord($score['id']);
                        }
                        break;
                }
            }
        }
    }
}