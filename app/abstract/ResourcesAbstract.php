<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class ResourcesAbstract extends ModelDefaultFunctions
{
    public $resources_id;

    public $ref;

    public $resources_group_id;

    public $section_id;

    public $section_subject_id;

    public $title;

    public $description;

    public $file_size;

    public $file_type;

    public $file_name;

    public $file_path;

    public $date_created;

    public $status;
}