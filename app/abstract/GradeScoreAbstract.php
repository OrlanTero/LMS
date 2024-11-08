<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class GradeScoreAbstract extends ModelDefaultFunctions
{
    public $grade_score_id;

    public $id;

    public $parent_id;

    public $category;

    public $grade;

    public $date_created;

    public $status;
}