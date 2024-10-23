<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class ResourcesGroupAbstract extends ModelDefaultFunctions
{
    public $resources_group_id;

    public $section_id;

    public $section_subject_id;

    public $ref;

    public $title;

    public $description;

    public $date_created;

    public $status;
}