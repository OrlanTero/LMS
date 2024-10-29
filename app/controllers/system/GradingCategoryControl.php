<?php

namespace Application\controllers\system;

use Application\abstract\ControlDefaultFunctions;
use Application\models\GradingCategory;

class GradingCategoryControl extends ControlDefaultFunctions
{
    protected $MODEL_CLASS = GradingCategory::class;
    protected $TABLE_NAME = "grading_categories";
    protected $TABLE_PRIMARY_ID = "grading_category_id";
    protected $SEARCH_LOOKUP = ["name"];

    public function edit($data)
    {
    }
}