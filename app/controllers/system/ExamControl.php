<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\models\Exam;

class ExamControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = Exam::class;
    protected $TABLE_NAME = "exams";
    protected $TABLE_PRIMARY_ID = "exam_id";
    protected $SEARCH_LOOKUP = ["title", "description"];

    public function edit($data)
    {
    }
}