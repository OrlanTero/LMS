<?php


namespace Application\models;

use Application\abstract\ActivityAbstract;

class Activity extends ActivityAbstract
{

    public $complies= [];
    public function __construct($data = [])
    {
        $this->applyData($data, ActivityAbstract::class);
        $this->init();
    }

    private function init(): void
    {
        global $APPLICATION;

        $this->complies = $APPLICATION->FUNCTIONS->ACTIVITY_COMPLY_CONTROL->filterRecords(['activity_id' => $this->activity_id], false);
    }

    public function isStudentComplied(int $student_id): bool
    {
        return in_array($student_id, array_column($this->complies, "student_id"));
    }

    public function getCompliedActivity(int $student_id): array
    {
        return array_filter($this->complies, function($comply) use ($student_id) {
            return $comply['student_id'] == $student_id;
        })[0] ?? null;
    }

    public function getCompliedActivities(): array
    {
        global $APPLICATION;
        return $APPLICATION->FUNCTIONS->ACTIVITY_COMPLY_CONTROL->filterRecords(['activity_id' => $this->activity_id], true);
    }
}